import { NextRequest, NextResponse } from 'next/server';
import { turso } from './tursoClient';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parentId');
    let rows;
    if (parentId === null) {
      const result = await turso.execute('SELECT * FROM options WHERE depth = 1');
      rows = result.rows;
    } else {
      const result = await turso.execute('SELECT * FROM options WHERE parentID = ?', [parentId]);
      rows = result.rows;
    }
    return NextResponse.json(rows);
  } catch (error) {
    return new NextResponse('Erreur serveur', { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, nameAr, priority = 1, tag, depth, parentID } = body;
    if (!name || !depth) {
      return new NextResponse('Champs obligatoires manquants', { status: 400 });
    }
    await turso.execute(
      'INSERT INTO options (name, nameAr, priority, tag, depth, parentID) VALUES (?, ?, ?, ?, ?, ?)',
      [name, nameAr, priority, tag, depth, parentID]
    );
    const result = await turso.execute('SELECT * FROM options WHERE name = ? AND depth = ?', [name, depth]);
    const option = result.rows[0] || null;
    return NextResponse.json(option, { status: 201 });
  } catch (error) {
    return new NextResponse('Erreur serveur', { status: 500 });
  }
}
