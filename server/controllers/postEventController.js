const supabase = require('../supabaseClient');

const normalizePostPayload = (payload = {}) => {
    return {
        title: payload.title || null,
        caption: payload.caption || null,
        event_date: payload.event_date || null,
        instagram_url: payload.instagram_url || null,
        image_url: payload.image_url || null,
        is_featured: Boolean(payload.is_featured)
    };
};

exports.getPublicPostEvents = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('post_events')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json(data || []);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllPostEvents = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('post_events')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json(data || []);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createPostEvent = async (req, res) => {
    try {
        const payload = normalizePostPayload(req.body);
        if (!payload.instagram_url || !payload.image_url) {
            return res.status(400).json({ error: 'instagram_url and image_url are required' });
        }

        const { data, error } = await supabase
            .from('post_events')
            .insert(payload)
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updatePostEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const payload = normalizePostPayload(req.body);

        const { data, error } = await supabase
            .from('post_events')
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

exports.deletePostEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('post_events')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.status(200).json({ message: 'Post event deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.uploadPostEventImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const safeName = req.file.originalname.replace(/[^a-zA-Z0-9_.-]/g, '-');
        const fileName = `post_${Date.now()}_${safeName}`;

        const { error } = await supabase.storage
            .from('post-event-media')
            .upload(fileName, req.file.buffer, {
                contentType: req.file.mimetype,
                upsert: false
            });

        if (error) throw error;

        const { data: urlData } = supabase.storage
            .from('post-event-media')
            .getPublicUrl(fileName);

        res.status(200).json({ url: urlData.publicUrl });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
