import { notFound } from "next/navigation";
import { getProjectById, listInterests, listUpdates } from "@/lib/projects";
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
  const [updates, interests] = await Promise.all([listUpdates(projectId), listInterests(projectId)]);

  return (
    <>
      <h1 className="h2">{project.emoji} {project.title}</h1>
      <p className="muted" style={{ margin: "0 0 20px", fontSize: 14 }}>
        建立於 {monthDay(project.createdAt)} · 最後動靜 {monthDay(project.lastActivityAt)}
      </p>
      <div className="grid2">
        <ProjectForm project={project} />
        <aside className="side">
          <UpdatesPanel projectId={projectId} items={updates} />
          <InterestsPanel projectId={projectId} items={interests} />
        </aside>
      </div>
    </>
  );
}
