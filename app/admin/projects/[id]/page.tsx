import { notFound } from "next/navigation";
import { getProjectById, listInterests, listUpdates } from "@/lib/projects";
import { listFriends } from "@/lib/friends";
import { listCategories } from "@/lib/categories";
import { db, stamps } from "@/lib/db";
import { eq } from "drizzle-orm";
import { monthDay } from "@/lib/format";
import { ProjectForm } from "@/components/admin/project-form";
import { UpdatesPanel } from "@/components/admin/updates-panel";
import { InterestsPanel } from "@/components/admin/interests-panel";

export async function generateMetadata(props: PageProps<"/admin/projects/[id]">) {
  const { id } = await props.params;
  const p = await getProjectById(Number(id));
  return { title: p ? `編輯：${p.title}` : "找不到" };
}

export default async function EditProjectPage(props: PageProps<"/admin/projects/[id]">) {
  const { id } = await props.params;
  const projectId = Number(id);
  if (!Number.isInteger(projectId)) notFound();
  const project = await getProjectById(projectId);
  if (!project) notFound();
  const [updates, interests, friends, stamped, cats] = await Promise.all([
    listUpdates(projectId),
    listInterests(projectId),
    listFriends(),
    db.query.stamps.findMany({ where: eq(stamps.projectId, projectId) }),
    listCategories(),
  ]);
  const stampedIds = new Set(stamped.map((s) => s.friendId));
  const friendOpts = friends.map((f) => ({ id: f.id, name: f.name, stamped: stampedIds.has(f.id) }));

  return (
    <>
      <h1 className="h2">{project.emoji} {project.title}</h1>
      <p className="muted" style={{ margin: "0 0 20px", fontSize: 14 }}>
        建立於 {monthDay(project.createdAt)} · 最後動靜 {monthDay(project.lastActivityAt)}
      </p>
      <div className="grid2">
        <ProjectForm project={project} friends={friendOpts} categories={cats} />
        <aside className="side">
          <UpdatesPanel projectId={projectId} items={updates} published={project.published} />
          <InterestsPanel projectId={projectId} items={interests} />
        </aside>
      </div>
    </>
  );
}
