import Link from "next/link";
import type { ProjectWithCount } from "@/lib/projects";
import { CATEGORY, EFFORT, SIZE } from "@/lib/labels";
import { People } from "./people";
import { StatusStamp } from "./status-stamp";

export function ProjectCard({ p, index = 0 }: { p: ProjectWithCount; index?: number }) {
  const specs = [EFFORT[p.effort], p.timeHint, p.idealSize ? SIZE[p.idealSize] : ""].filter(Boolean);
  return (
    <Link
      className="card"
      href={`/p/${p.slug}`}
      style={{ ["--cat" as string]: CATEGORY[p.category].color, animationDelay: `${Math.min(index * 50, 300)}ms` }}
    >
      {p.coverUrl && (
        <div className="cover">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.coverUrl} alt="" loading="lazy" />
        </div>
      )}
      <div className="row1">
        <span className="emoji" aria-hidden="true">{p.emoji}</span>
        <h3 className="title">{p.title}</h3>
        <StatusStamp status={p.status} />
      </div>
      {p.tagline && <p className="one">{p.tagline}</p>}
      <div className="foot">
        <div className="spec">{specs.map((s) => <span key={s}>{s}</span>)}</div>
        {p.interestCount > 0 && <People count={p.interestCount} max={3} />}
      </div>
    </Link>
  );
}
