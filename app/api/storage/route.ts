import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { extractFilePath } from '@/lib/storage';

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Get file metadata from formData
        const folder = formData.get('folder') as string || 'products';
        const fileName = formData.get('fileName') as string || file.name;

        // Sanitize filename: remove spaces, special characters, and make URL-safe
        const sanitizedFileName = fileName
            .replace(/\s+/g, '-')           // Replace spaces with hyphens
            .replace(/[^a-zA-Z0-9.-]/g, '') // Remove special characters except dots and hyphens
            .toLowerCase();                  // Convert to lowercase for consistency

        // Create a unique file name to avoid collisions
        const uniqueFileName = `${Date.now()}-${sanitizedFileName}`;
        const filePath = `${folder}/${uniqueFileName}`;

        // Convert file to ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        const fileBuffer = new Uint8Array(arrayBuffer);

        // Upload to Supabase Storage
        const { error } = await supabase.storage
            .from('product-images')
            .upload(filePath, fileBuffer, {
                contentType: file.type,
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('Supabase storage upload error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(filePath);

        return NextResponse.json({
            url: publicUrl,
            path: filePath,
            success: true
        });

    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json(
            { error: 'Failed to upload file', details: error },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const path = searchParams.get('path');
        console.log('Deleting file at path:', path);

        if (!path) {
            return NextResponse.json({ error: 'No file path provided' }, { status: 400 });
        }
        const filePath = extractFilePath(path);
        if (!filePath) {
            return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
        }
        // Delete from Supabase Storage
        const { error } = await supabase.storage
            .from('product-images')
            .remove([filePath]);

        if (error) {
            console.error('Supabase storage delete error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            message: 'File deleted successfully',
            success: true
        });

    } catch (error) {
        console.error('Error deleting file:', error);
        return NextResponse.json(
            { error: 'Failed to delete file', details: error },
            { status: 500 }
        );
    }
}