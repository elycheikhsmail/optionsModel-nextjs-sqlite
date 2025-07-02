import { NextRequest, NextResponse } from 'next/server';
import { turso } from '../tursoClient';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const body = await request.json();
    const { name, nameAr, priority = 1, tag, depth, parentID } = body;
    if (!id || !name || !depth) {
      return new NextResponse('Champs obligatoires manquants', { status: 400 });
    }
    await turso.execute(
      'UPDATE options SET name = ?, nameAr = ?, priority = ?, tag = ?, depth = ?, parentID = ? WHERE id = ?',
      [name, nameAr, priority, tag, depth, parentID, id]
    );
    const result = await turso.execute('SELECT * FROM options WHERE id = ?', [id]);
    const option = result.rows[0] || null;
    return NextResponse.json(option, { status: 200 });
  } catch (error) {
    return new NextResponse('Erreur serveur', { status: 500 });
  }
}
