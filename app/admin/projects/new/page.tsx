import { ProjectForm } from "@/components/admin/project-form";

export const metadata = { title: "寫下一個想法" };

export default function NewProjectPage() {
  return (
    <>
      <h1 className="h2">寫下一個想法</h1>
      <p className="muted" style={{ margin: "0 0 20px", fontSize: 14 }}>先存成未發布也可以，想好再打開。</p>
      <div className="grid2">
        <ProjectForm project={null} />
      </div>
    </>
  );
}
