export const extractPathFromUrl = (url: string): string | null => {
    // Check if it's a Supabase URL
    if (url.includes('supabase')) {
        try {
            // Extract the path portion after /storage/v1/object/public/
            const regex = /\/storage\/v1\/object\/public\/([^?]+)/;
            const match = url.match(regex);
            if (match && match[1]) {
                return decodeURIComponent(match[1]);
            }
        } catch (error) {
            console.error('Error extracting path from URL:', error);
        }
    }
    return null;
};

export function extractFilePath(encodedPath: string): string {
    const decoded = decodeURIComponent(encodedPath); // Decode %2F into /
    const bucket = 'product-images/';

    if (decoded.startsWith(bucket)) {
        return decoded.slice(bucket.length); // Remove 'product-images/' prefix
    }

    return decoded;
}