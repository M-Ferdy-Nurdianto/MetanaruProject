const ExcelJS = require('exceljs');
const { jsPDF } = require('jspdf');
require('jspdf-autotable');
const supabase = require('../supabaseClient');
const fs = require('fs');
const path = require('path');

// =============================================
// Internal pricing logic
// =============================================
const calculateInternalPrice = async (eventId, chekiType) => {
    const normalizedType = chekiType === 'group' ? 'group' : 'solo';

    const { data: event } = await supabase
        .from('events')
        .select('type, special_solo_price, special_group_price')
        .eq('id', eventId)
        .single();

    if (event && event.type === 'special') {
        if (normalizedType === 'group' && event.special_group_price) {
            return event.special_group_price;
        }
        if (normalizedType === 'solo' && event.special_solo_price) {
            return event.special_solo_price;
        }
    }

    const { data: settings } = await supabase
        .from('settings')
        .select('prices')
        .eq('id', 1)
        .single();

    if (settings && settings.prices) {
        const key = normalizedType === 'group' ? 'regular_cheki_group' : 'regular_cheki_solo';
        if (settings.prices[key]) {
            return settings.prices[key];
        }
    }

    return normalizedType === 'group' ? 30000 : 25000;
};

// =============================================
// ORDERS
// =============================================
exports.createOrder = async (req, res) => {
    try {
        const { event_id, member_id, items, cheki_type, qty, mode, payment_proof_url, nickname, contact, payment_method, note } = req.body;
        const normalizedChekiType = cheki_type === 'group' ? 'group' : 'solo';

        let final_member_id = member_id;
        let final_qty = qty;
        let total_price = 0;

        if (items && Array.isArray(items) && items.length > 0) {
            let sum = 0;
            for (const item of items) {
                const itemType = item.cheki_type === 'group' ? 'group' : 'solo';
                const itemPrice = await calculateInternalPrice(event_id, itemType || normalizedChekiType);
                sum += itemPrice * item.qty;
            }
            total_price = sum;
            final_member_id = items.map(i => `${i.member_id} x${i.qty}`).join(', ');
            final_qty = items.reduce((acc, i) => acc + i.qty, 0);
        } else {
            const price = await calculateInternalPrice(event_id, normalizedChekiType);
            total_price = price * qty;
        }

        const { data, error } = await supabase
            .from('orders')
            .insert({
                nickname,
                contact,
                event_id,
                member_id: final_member_id,
                items: items || [],
                cheki_type: normalizedChekiType,
                qty: final_qty,
                total_price,
                mode,
                payment_method: payment_method || 'cash',
                payment_proof_url: mode === 'ots' ? null : payment_proof_url,
                status: mode === 'ots' ? 'paid' : 'pending',
                note
            })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        console.error('createOrder error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        console.error('🚨 DETAILED ERROR in getAllOrders:', JSON.stringify(error, null, 2));
        res.status(500).json({ error: error.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const { data, error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const payload = req.body || {};

        const { data, error } = await supabase
            .from('orders')
            .update(payload)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('orders')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.status(200).json({ message: 'Order deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// =============================================
// IMAGE UPLOAD (Payment Proof)
// =============================================
exports.uploadProof = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const fileName = `proof_${Date.now()}_${req.file.originalname}`;
        const { data, error } = await supabase.storage
            .from('payment-proofs')
            .upload(fileName, req.file.buffer, {
                contentType: req.file.mimetype,
                upsert: false
            });

        if (error) throw error;

        const { data: urlData } = supabase.storage
            .from('payment-proofs')
            .getPublicUrl(fileName);

        res.status(200).json({ url: urlData.publicUrl });
    } catch (error) {
        console.error('uploadProof error:', error);
        res.status(500).json({ error: error.message });
    }
};

// =============================================
// EVENTS
// =============================================
exports.getAllEvents = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Auto-mark past events as done and normalize fields for frontend
        const now = new Date();
        const updatedEvents = data.map(ev => {
            let status = ev.status;
            if (ev.po_deadline && new Date(ev.po_deadline) < now && ev.status !== 'done') {
                status = 'done';
            }
            return { 
                ...ev, 
                status,
                event_date: ev.date, // For Admin.jsx compatibility
                event_time: ev.time, // For Admin.jsx compatibility
                special_prices: { // For Admin.jsx compatibility
                    solo: ev.special_solo_price,
                    group: ev.special_group_price
                }
            };
        });

        res.status(200).json(updatedEvents);
    } catch (error) {
        console.error('🚨 DETAILED ERROR in getAllEvents:', JSON.stringify(error, null, 2));
        res.status(500).json({ error: error.message });
    }
};

exports.addEvent = async (req, res) => {
    try {
        const { 
            name, date, time, status, type, location, 
            po_deadline, available_members, special_solo_price, 
            special_group_price, group_enabled, theme, lineup 
        } = req.body;
        
        // Map fields and exclude non-existent columns (like lineup)
        const payload = {
            name,
            date,
            time,
            status: status || 'ongoing',
            type: type === 'standard' ? 'regular' : type,
            location,
            po_deadline,
            available_members: available_members || [],
            special_solo_price: parseInt(special_solo_price) || 30000,
            special_group_price: parseInt(special_group_price) || 35000,
            group_enabled: group_enabled !== undefined ? group_enabled : true,
            theme,
            is_active: true
        };

        console.log('Adding event with payload:', payload);

        const { data, error } = await supabase
            .from('events')
            .insert(payload)
            .select()
            .single();

        if (error) {
            console.error('Supabase error adding event:', error);
            throw error;
        }
        res.status(201).json(data);
    } catch (error) {
        console.error('addEvent error:', error);
        res.status(500).json({ error: error.message, detail: error });
    }
};

exports.updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            name, date, time, status, type, location, 
            po_deadline, available_members, special_solo_price, 
            special_group_price, group_enabled, theme, lineup 
        } = req.body;

        const payload = {
            name,
            date,
            time,
            status,
            type: type === 'standard' ? 'regular' : type,
            location,
            po_deadline,
            available_members: available_members || [],
            special_solo_price: parseInt(special_solo_price) || 30000,
            special_group_price: parseInt(special_group_price) || 35000,
            group_enabled: group_enabled !== undefined ? group_enabled : true,
            theme
        };

        const { data, error } = await supabase
            .from('events')
            .update(payload)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Supabase error updating event:', error);
            throw error;
        }
        res.status(200).json(data);
    } catch (error) {
        console.error('updateEvent error:', error);
        res.status(500).json({ error: error.message, detail: error });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('events')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// =============================================
// SETTINGS
// =============================================
exports.getSettings = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('settings')
            .select('*')
            .eq('id', 1)
            .single();

        if (error) throw error;
        res.status(200).json(data || { prices: { regular_cheki_solo: 30000, regular_cheki_group: 35000 } });
    } catch (error) {
        console.error('🚨 DETAILED ERROR in getSettings:', JSON.stringify(error, null, 2));
        console.error('Stack Trace:', error.stack);
        res.status(500).json({ error: error.message, detail: error });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('settings')
            .update(req.body)
            .eq('id', 1)
            .select()
            .single();

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// =============================================
// KEEP ALIVE
// =============================================
exports.getKeepAlive = async (req, res) => {
    try {
        const { data, error } = await supabase.from('members').select('id').limit(1);
        if (error) throw error;
        res.status(200).json({ status: 'active', message: 'Supabase is awake', data });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// =============================================
// EXPORT: EXCEL
// =============================================
exports.exportToExcel = async (req, res) => {
    try {
        const { eventId } = req.params;

        // Get event info
        let event = null;
        if (eventId !== 'all') {
            const { data } = await supabase.from('events').select('*').eq('id', eventId).single();
            event = data;
        }

        // Get orders
        let query = supabase.from('orders').select('*').neq('status', 'pending');
        if (eventId !== 'all') query = query.eq('event_id', eventId);
        const { data: eventOrders, error } = await query;
        if (error) throw error;

        const workbook = new ExcelJS.Workbook();
        
        // Add Logo to Workbook
        const logoPath = path.join(__dirname, '../../client/public/logos/logo.png');
        let logoId = null;
        if (fs.existsSync(logoPath)) {
            logoId = workbook.addImage({
                buffer: fs.readFileSync(logoPath),
                extension: 'png',
            });
        }

        // SHEET 1: SUMMARY
        const summarySheet = workbook.addWorksheet('Event Summary');
        
        if (logoId !== null) {
            summarySheet.addImage(logoId, {
                tl: { col: 0, row: 0 },
                ext: { width: 120, height: 40 }
            });
            // Push content down to avoid overlapping with logo
            summarySheet.addRow([]);
            summarySheet.addRow([]);
            summarySheet.addRow([]);
        }

        summarySheet.columns = [
            { header: 'Metric', key: 'metric', width: 30 },
            { header: 'Value', key: 'value', width: 25 },
            { header: 'Note', key: 'note', width: 20 }
        ];

        const totalSales = eventOrders.reduce((acc, o) => acc + o.total_price, 0);
        const totalQty = eventOrders.reduce((acc, o) => acc + o.qty, 0);

        summarySheet.addRow({ metric: 'Event Name', value: event ? event.name : 'All Events' });
        summarySheet.addRow({ metric: 'Total Revenue', value: totalSales });
        summarySheet.addRow({ metric: 'Total Polaroid Sold', value: totalQty });
        summarySheet.addRow({});

        summarySheet.addRow({ metric: 'MEMBER BREAKDOWN', value: '' });
        const memberStats = {};
        for (const o of eventOrders) {
            const members = (o.member_id || '').split(', ');
            for (const mStr of members) {
                const parts = mStr.split(' x');
                const name = parts[0];
                const qty = parts[1] ? parseInt(parts[1]) : o.qty;
                if (!memberStats[name]) memberStats[name] = { qty: 0, revenue: 0 };
                memberStats[name].qty += qty;
                const price = await calculateInternalPrice(o.event_id, o.cheki_type, name);
                memberStats[name].revenue += (price * qty);
            }
        }

        summarySheet.addRow({ metric: 'Member', value: 'Qty Sold' });
        Object.entries(memberStats).forEach(([name, stats]) => {
            summarySheet.addRow({ metric: name, value: stats.qty });
            summarySheet.lastRow.getCell(3).value = stats.revenue;
        });

        summarySheet.getRow(1).font = { bold: true };
        summarySheet.getColumn(2).numFmt = '#,##0';
        summarySheet.getColumn(3).numFmt = '"Rp "#,##0';

        // SHEET 2: RAW DATA
        const detailSheet = workbook.addWorksheet('Order Details');
        detailSheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Nickname', key: 'nickname', width: 20 },
            { header: 'Contact', key: 'contact', width: 25 },
            { header: 'Items', key: 'member_id', width: 35 },
            { header: 'Qty', key: 'qty', width: 8 },
            { header: 'Total Price', key: 'total_price', width: 15 },
            { header: 'Payment', key: 'payment_method', width: 12 },
            { header: 'Status', key: 'status', width: 12 },
            { header: 'Date', key: 'created_at', width: 20 },
        ];

        eventOrders.forEach(order => {
            detailSheet.addRow({
                ...order,
                created_at: new Date(order.created_at).toLocaleString('id-ID')
            });
        });

        detailSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFE96B' } };
        detailSheet.getRow(1).font = { bold: true };

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=METANARU_Report_${event ? event.name.replace(/\s+/g, '_') : 'All'}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('exportToExcel error:', error);
        res.status(500).json({ error: error.message });
    }
};

// =============================================
// EXPORT: PDF
// =============================================
exports.exportToPdf = async (req, res) => {
    try {
        const { eventId } = req.params;

        let event = null;
        if (eventId !== 'all') {
            const { data } = await supabase.from('events').select('*').eq('id', eventId).single();
            event = data;
        }

        let query = supabase.from('orders').select('*').neq('status', 'pending');
        if (eventId !== 'all') query = query.eq('event_id', eventId);
        const { data: eventOrders, error } = await query;
        if (error) throw error;

        const doc = new jsPDF();
        const pink = [255, 41, 117];
        const dark = [18, 18, 20];

        // Header Section
        doc.setFillColor(...dark);
        doc.rect(0, 0, 210, 45, 'F');

        // Logo insertion
        const logoPath = path.join(__dirname, '../../client/public/logos/logo.png');
        if (fs.existsSync(logoPath)) {
            const logoBase64 = fs.readFileSync(logoPath).toString('base64');
            doc.addImage(logoBase64, 'PNG', 14, 10, 25, 25);
        }

        doc.setFontSize(28);
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.text("METANARU", 45, 25);
        doc.setTextColor(...pink);
        doc.text(".REPORT", 95, 25);

        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.setFont("helvetica", "normal");
        doc.text(`OFFICIAL SALES SUMMARY \u2022 ${new Date().toLocaleDateString('id-ID')}`, 14, 35);

        // Event Info Box
        doc.setFillColor(245, 245, 245);
        doc.rect(140, 15, 56, 20, 'F');
        doc.setTextColor(100);
        doc.setFontSize(8);
        doc.text("EVENT", 145, 22);
        doc.setTextColor(0);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(event ? event.name : 'ALL EVENTS', 145, 28, { maxWidth: 46 });

        // Analytics
        const totalSales = eventOrders.reduce((acc, o) => acc + o.total_price, 0);
        const totalQty = eventOrders.reduce((acc, o) => acc + o.qty, 0);
        const otsCount = eventOrders.filter(o => o.mode === 'ots').length;
        const poCount = eventOrders.filter(o => o.mode !== 'ots').length;

        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text("SALES OVERVIEW", 14, 60);
        doc.setDrawColor(...pink);
        doc.setLineWidth(1);
        doc.line(14, 62, 30, 62);

        const drawCard = (x, y, label, value) => {
            doc.setFillColor(...dark);
            doc.roundedRect(x, y, 45, 25, 1, 1, 'F');
            
            // Card Top Border (Pink)
            doc.setFillColor(...pink);
            doc.rect(x, y, 45, 1.5, 'F');

            doc.setTextColor(150, 150, 150);
            doc.setFontSize(7);
            doc.setFont("helvetica", "bold");
            doc.text(label, x + 5, y + 8);
            
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text(value, x + 5, y + 18);
        };

        drawCard(14, 68, "TOTAL REVENUE", `Rp ${totalSales.toLocaleString()}`);
        drawCard(63, 68, "TOTAL SOLD", `${totalQty} units`);
        drawCard(112, 68, "BOOTH (OTS)", `${otsCount} orders`);
        drawCard(161, 68, "PRE-ORDER", `${poCount} orders`);

        // Member Performance
        doc.setFontSize(14);
        doc.setTextColor(...dark);
        doc.setFont("helvetica", "bold");
        doc.text("MEMBER PERFORMANCE", 14, 110);
        
        // Performance Divider
        doc.setDrawColor(...pink);
        doc.setLineWidth(0.5);
        doc.line(14, 112, 25, 112);

        const memberStats = {};
        for (const o of eventOrders) {
            const membersList = (o.member_id || '').split(', ');
            for (const mStr of membersList) {
                const parts = mStr.split(' x');
                const name = parts[0];
                const qty = parts[1] ? parseInt(parts[1]) : o.qty;
                if (!memberStats[name]) memberStats[name] = { qty: 0, revenue: 0 };
                memberStats[name].qty += qty;
                const price = await calculateInternalPrice(o.event_id, o.cheki_type, name);
                memberStats[name].revenue += (price * qty);
            }
        }

        const summaryData = Object.entries(memberStats).map(([name, stats]) => [
            name.toUpperCase(), stats.qty, `Rp ${stats.revenue.toLocaleString()}`
        ]);

        doc.autoTable({
            head: [['MEMBER / LINEUP', 'QTY SOLD', 'REVENUE']],
            body: summaryData,
            startY: 118,
            theme: 'striped',
            headStyles: { fillColor: dark, textColor: pink, fontStyle: 'bold', fontSize: 10 },
            styles: { fontSize: 9, cellPadding: 5, font: 'helvetica' },
            columnStyles: { 2: { halign: 'right', fontStyle: 'bold', textColor: dark } },
            alternateRowStyles: { fillColor: [250, 250, 250] }
        });

        // Transaction Details
        doc.addPage();
        doc.setFillColor(...dark);
        doc.rect(0, 0, 210, 20, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.text("TRANSACTION DETAILS ARCHIVE", 14, 13);

        const detailData = eventOrders.map(o => [
            `#${o.id}`,
            o.nickname,
            o.mode.toUpperCase(),
            o.member_id,
            `Rp ${o.total_price.toLocaleString()}`,
            o.status.toUpperCase() === 'PAID' ? 'CHEKE' : o.status.toUpperCase() === 'PENDING' ? 'UNCEK' : 'DONE'
        ]);

        doc.autoTable({
            head: [['ID', 'CUSTOMER', 'TYPE', 'ITEMS', 'AMOUNT', 'STATUS']],
            body: detailData,
            startY: 25,
            styles: { fontSize: 8, font: 'helvetica' },
            headStyles: { fillColor: dark, textColor: [200, 200, 200], fontStyle: 'bold' },
            columnStyles: { 
                4: { halign: 'right', fontStyle: 'bold', textColor: [200, 0, 40] },
                5: { halign: 'center', fontStyle: 'bold' }
            },
            alternateRowStyles: { fillColor: [252, 252, 252] }
        });

        // Footer Enhancement
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            
            // Dark Footer Bar
            doc.setFillColor(...dark);
            doc.rect(0, 280, 210, 20, 'F');
            
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text(`GENERATED BY METANARU CORE SYSTEM \u2022 v2.0.4`, 14, 288);
            
            doc.setTextColor(255, 255, 255);
            doc.setFont("helvetica", "bold");
            doc.text(`PAGE ${i} / ${pageCount}`, 180, 288);
            
            // Pink Accent line in footer
            doc.setFillColor(...pink);
            doc.rect(0, 280, 210, 0.5, 'F');
        }

        const pdfOutput = doc.output();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=METANARU_Report_${eventId}.pdf`);
        res.send(Buffer.from(pdfOutput, 'binary'));
    } catch (error) {
        console.error('exportToPdf error:', error);
        res.status(500).json({ error: error.message });
    }
};
