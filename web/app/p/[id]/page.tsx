import { auth } from "@/lib/auth";

async function getPost(id: string) {
  const r = await fetch(`${process.env.NEXTAUTH_URL}/api/posts/${id}`, { cache: "no-store" });
  return r.json();
}

export default async function PaidPost({ params }: { params: { id: string } }) {
  await auth();
  const data = await getPost(params.id);

  if (data?.paywalled) return <div className="text-white/70">Payment required…</div>;

  const post = data.post;
  return (
    <div className="grid gap-4">
      <h2 className="text-2xl font-extrabold">Paid Content</h2>
      <article className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="text-sm text-white/60">{new Date(post.createdAt).toLocaleString()}</div>
        {post.text && <div className="mt-2 whitespace-pre-wrap">{post.text}</div>}
        {post.mediaUrl && post.mediaType === "image" && <img alt="" src={post.mediaUrl} className="mt-3 w-full rounded-2xl border border-white/10" />}
        {post.mediaUrl && post.mediaType === "video" && <video className="mt-3 w-full rounded-2xl border border-white/10" controls src={post.mediaUrl} />}
      </article>
    </div>
  );
}
