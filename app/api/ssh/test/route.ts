import { NextRequest, NextResponse } from 'next/server';
import { SSHEngine } from '@/lib/ssh-engine';
import { encryptCredential } from '@/lib/security';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { host, port, username, password } = body;

    const ssh = new SSHEngine();
    await ssh.connect({ host, port, username, password });
    
    // If successful, return encrypted password for client storage
    const encryptedPassword = await encryptCredential(password);
    ssh.dispose();

    return NextResponse.json({ 
      success: true, 
      encryptedPassword 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}
