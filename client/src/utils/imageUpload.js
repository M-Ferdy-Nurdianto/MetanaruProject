const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to read image file'));
        reader.readAsDataURL(file);
    });
};

const loadImage = (src) => {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('Failed to decode image'));
        image.src = src;
    });
};

const getResizedDimension = (width, height, maxWidth, maxHeight) => {
    let nextWidth = width;
    let nextHeight = height;

    if (nextWidth > nextHeight && nextWidth > maxWidth) {
        nextHeight *= maxWidth / nextWidth;
        nextWidth = maxWidth;
    } else if (nextHeight >= nextWidth && nextHeight > maxHeight) {
        nextWidth *= maxHeight / nextHeight;
        nextHeight = maxHeight;
    }

    return {
        width: Math.max(1, Math.round(nextWidth)),
        height: Math.max(1, Math.round(nextHeight))
    };
};

export const buildWebpFileName = (originalName = 'image', prefix = 'image') => {
    const baseName = String(originalName)
        .replace(/\.[^/.]+$/, '')
        .replace(/[^a-zA-Z0-9_-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

    return `${baseName || prefix}-${Date.now()}.webp`;
};

export const convertFileToWebp = async (file, options = {}) => {
    if (!file || !String(file.type || '').startsWith('image/')) {
        throw new Error('File must be an image');
    }

    const maxWidth = options.maxWidth || 1600;
    const maxHeight = options.maxHeight || 1600;
    const quality = typeof options.quality === 'number' ? options.quality : 0.8;

    const sourceDataUrl = await readFileAsDataURL(file);
    const sourceImage = await loadImage(sourceDataUrl);
    const size = getResizedDimension(sourceImage.width, sourceImage.height, maxWidth, maxHeight);

    const canvas = document.createElement('canvas');
    canvas.width = size.width;
    canvas.height = size.height;

    const context = canvas.getContext('2d', { alpha: true });
    if (!context) {
        throw new Error('Unable to process image');
    }

    context.drawImage(sourceImage, 0, 0, size.width, size.height);

    const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/webp', quality);
    });

    if (!blob) {
        throw new Error('Failed to convert image to WebP');
    }

    return blob;
};
