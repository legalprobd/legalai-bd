import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth-check";

export async function GET() {
  try {
    const authCheck = await requireAuth();
    if (!authCheck.ok) return authCheck.response!;

    const tasks = await db.getTasks();
    return NextResponse.json({ ok: true, data: tasks });
  } catch (error) {
    console.error("Error in GET /api/tasks:", error);
    return NextResponse.json(
      { ok: false, error: { messageBn: "টাস্ক তালিকা লোড করতে সমস্যা হয়েছে।" } },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authCheck = await requireAuth();
    if (!authCheck.ok) return authCheck.response!;

    const body = await request.json();
    const { title, caseId, caseTitle, assignedTo, dueDate, priority, notes } = body;

    if (!title || !assignedTo) {
      return NextResponse.json(
        { ok: false, error: { messageBn: "টাস্কের শিরোনাম ও দায়িত্বপ্রাপ্ত সদস্য আবশ্যক।" } },
        { status: 400 }
      );
    }

    const newTask = await db.createTask({
      title: title.trim(),
      caseId,
      caseTitle,
      assignedTo,
      assignedBy: "ব্যারিস্টার এম. এ. রহমান (অ্যাডভোকেট)",
      dueDate: dueDate || new Date(Date.now() + 2 * 86400000).toISOString(),
      priority: priority || "MEDIUM",
      status: "TODO",
      notes: notes?.trim(),
    });

    await db.logAudit(authCheck.userId!, "TASK_ASSIGNED", {
      taskId: newTask.id,
      title: newTask.title,
      assignedTo,
    });

    return NextResponse.json({ ok: true, data: newTask });
  } catch (error) {
    console.error("Error in POST /api/tasks:", error);
    return NextResponse.json(
      { ok: false, error: { messageBn: "টাস্ক তৈরি ব্যর্থ হয়েছে।" } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const authCheck = await requireAuth();
    if (!authCheck.ok) return authCheck.response!;

    const body = await request.json();
    const { taskId, status } = body;

    if (!taskId || !status) {
      return NextResponse.json(
        { ok: false, error: { messageBn: "টাস্ক আইডি ও স্ট্যাটাস প্রদান করুন।" } },
        { status: 400 }
      );
    }

    const updated = await db.updateTaskStatus(taskId, status);
    if (!updated) {
      return NextResponse.json(
        { ok: false, error: { messageBn: "উক্ত টাস্কটি পাওয়া যায়নি।" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data: updated });
  } catch (error) {
    console.error("Error in PATCH /api/tasks:", error);
    return NextResponse.json(
      { ok: false, error: { messageBn: "টাস্ক আপডেট ব্যর্থ হয়েছে।" } },
      { status: 500 }
    );
  }
}
