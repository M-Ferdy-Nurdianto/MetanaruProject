const supabase = require('../supabaseClient');
const fs = require('fs');
const path = require('path');
const logFile = path.join(__dirname, '../debug.log');

// Get all members
exports.getMembers = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('members')
            .select('*')
            .order('id', { ascending: true }); // By default, let's keep array order

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        fs.appendFileSync(logFile, `[${new Date().toISOString()}] getMembers error: ${error.stack || error}\x0a`);
        console.error('getMembers error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.addMember = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('members')
            .insert(req.body)
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateMember = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('members')
            .update(req.body)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteMember = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('members')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.status(200).json({ message: 'Member deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.uploadMemberPhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const fileName = `member_${Date.now()}_${req.file.originalname}`;
        const { data, error } = await supabase.storage
            .from('member-photos')
            .upload(fileName, req.file.buffer, {
                contentType: req.file.mimetype,
                upsert: false
            });

        if (error) throw error;

        const { data: urlData } = supabase.storage
            .from('member-photos')
            .getPublicUrl(fileName);

        res.status(200).json({ url: urlData.publicUrl });
    } catch (error) {
        console.error('uploadMemberPhoto error:', error);
        res.status(500).json({ error: error.message });
    }
};


// Get discography with its embedded songs
exports.getDiscography = async (req, res) => {
    try {
        // Fetch all discography
        const { data: discoData, error: discoErr } = await supabase
            .from('discography')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (discoErr) throw discoErr;

        // Fetch all songs
        const { data: songsData, error: songsErr } = await supabase
            .from('songs')
            .select('*')
            .order('id', { ascending: true });

        if (songsErr) throw songsErr;

        // Map songs back into the discography array to mimic the frontend object exactly
        const finalData = discoData.map(disco => {
            return {
                ...disco,
                songs: songsData.filter(song => song.discography_id === disco.id)
            };
        });

        res.status(200).json(finalData);
    } catch (error) {
        console.error('getDiscography error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Admin Login (Verify username & password via Supabase RPC)
exports.loginAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const { data: isValid, error } = await supabase.rpc('verify_admin', {
            p_username: username,
            p_password: password
        });

        if (error) throw error;

        if (isValid) {
            res.status(200).json({ success: true, message: 'Login successful' });
        } else {
            res.status(401).json({ success: false, error: 'Kredensial tidak valid' });
        }
    } catch (error) {
        console.error('loginAdmin error:', error);
        res.status(500).json({ error: error.message });
    }
};

