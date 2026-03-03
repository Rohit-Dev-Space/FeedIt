import { STATUS_ORDER } from "@/app/data/status-data";
import prisma from "@/lib/prisma";
import { syncCurrentUser } from "@/lib/sync-user";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const dbUser = await syncCurrentUser();

        if (!dbUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (dbUser.role !== "admin") {
            return NextResponse.json(
                { error: "Admin access required" },
                { status: 403 }
            );
        }

        const { status } = await request.json();
        const { id } = await params;           // ✅ FIX
        const postId = Number(id);

        if (Number.isNaN(postId)) {
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
            where: { id: postId },
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