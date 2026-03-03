import { STATUS_ORDER } from "@/app/data/status-data";
import prisma from "@/lib/prisma";
import { syncCurrentUser } from "@/lib/sync-user";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const dbUser = await syncCurrentUser();

        if (!dbUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Admin check
        const user = await prisma.user.findUnique({
            where: {
                clerkUserId: dbUser.id.toString(),
            },
        });

        if (!user || user.role !== "admin") {
            return NextResponse.json(
                { error: "Admin access required" },
                { status: 403 }
            );
        }

        const { status } = await request.json();
        const { id } = params;
        const numericPostId = Number(id);

        if (Number.isNaN(numericPostId)) {
            return NextResponse.json(
                { error: "Invalid post ID" },
                { status: 400 }
            );
        }

        if (!STATUS_ORDER.includes(status)) {
            return NextResponse.json(
                { error: "Invalid status" },
                { status: 400 }
            );
        }

        const updatedPost = await prisma.post.update({
            where: { id: numericPostId },
            data: { status },
            include: {
                author: true,
                votes: true,
            },
        });

        return NextResponse.json(updatedPost);
    } catch (error) {
        console.error("Error updating post status:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}