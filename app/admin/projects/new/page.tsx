import { ProjectForm } from "@/components/admin/project-form";
import { listCategories } from "@/lib/categories";

export const metadata = { title: "寫下一個想法" };

export default async function NewProjectPage() {
  const cats = await listCategories();
  return (
    <>
      <h1 className="h2">寫下一個想法</h1>
      <p className="muted" style={{ margin: "0 0 20px", fontSize: 14 }}>先存成未發布也可以，想好再打開。</p>
      <div className="grid2">
        <ProjectForm project={null} categories={cats} />
      </div>
    </>
  );
}
