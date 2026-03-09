const { PrismaClient } = require('../src/generated/prisma');
const prisma = new PrismaClient();

function slugify(text) {
  return text.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function main() {
  const posts = await prisma.blogPost.findMany();
  for (const post of posts) {
    if (!post.slug) {
      const slug = slugify(post.title) + '-' + post.id.slice(0, 6);
      await prisma.blogPost.update({ where: { id: post.id }, data: { slug } });
      console.log('Updated:', post.title, '->', slug);
    }
  }
  console.log('Done');
}
main().finally(() => prisma.$disconnect());
