import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const chamaId = (session.user as any).chamaId;
  if (!chamaId) {
    return new NextResponse("Chama not found", { status: 404 });
  }

  const integrations = await prisma.integration.findMany({
    where: { chamaId },
  });

  return NextResponse.json(integrations);
}

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const chamaId = (session.user as any).chamaId;
  if (!chamaId) {
    return new NextResponse("Chama not found", { status: 404 });
  }

  const body = await req.json();
  const { type, config, name, isEnabled, id } = body;

  if (id) {
    // Update existing
    const integration = await prisma.integration.update({
      where: { id },
      data: {
        type,
        config: config || {},
        name,
        isEnabled: isEnabled !== undefined ? isEnabled : true,
      },
    });
    return NextResponse.json(integration);
  } else {
    // Create new
    const integration = await prisma.integration.create({
      data: {
        type,
        config: config || {},
        name,
        isEnabled: isEnabled !== undefined ? isEnabled : true,
        chamaId,
      },
    });
    return NextResponse.json(integration);
  }
}
