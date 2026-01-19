import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const searchQuery = url.searchParams.get('search') || '';
    
    // Fetch schools with optional search filter
    const schools = await prisma.school.findMany({
      where: searchQuery ? {
        OR: [
          { name: { contains: searchQuery, mode: 'insensitive' } },
          { address: { contains: searchQuery, mode: 'insensitive' } },
        ]
      } : {},
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(schools);
  } catch (error) {
    console.error('Error fetching schools:', error);
    return NextResponse.json({ error: 'Failed to fetch schools' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;

    // Validate school name
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'School name is required' },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();

    // Check if school already exists (case-insensitive)
    const existingSchool = await prisma.school.findFirst({
      where: {
        name: {
          equals: trimmedName,
          mode: 'insensitive'
        }
      }
    });

    if (existingSchool) {
      return NextResponse.json(
        { error: 'School already exists', school: existingSchool },
        { status: 409 }
      );
    }

    // Create new school
    const newSchool = await prisma.school.create({
      data: {
        name: trimmedName,
      }
    });

    return NextResponse.json({
      school: newSchool,
      success: true,
      message: 'School created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating school:', error);
    return NextResponse.json(
      { error: 'Failed to create school' },
      { status: 500 }
    );
  }
} 