import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// URL パラメータ id を number に安全に変換（整数以外は null）
const parseId = (raw: string): number | null => {
  const id = Number(raw);
  return Number.isInteger(id) ? id : null;
};

// 要件: GET / で "Hello World" を返す
app.get("/", (_req, res) => {
  res.send("Hello World");
});

// 一覧取得
app.get(
  "/contents",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const items = await prisma.content.findMany({ orderBy: { id: "desc" } });
      res.json(items);
    } catch (e) {
      next(e);
    }
  }
);

// 1件取得
app.get(
  "/contents/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseId(req.params.id);
      if (id == null) return res.status(400).json({ message: "invalid id" });

      const item = await prisma.content.findUnique({ where: { id } });
      if (!item) return res.status(404).json({ message: "not found" });

      res.json(item);
    } catch (e) {
      next(e);
    }
  }
);

// 作成
app.post(
  "/contents",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, body } = req.body;
      if (!title) return res.status(400).json({ message: "title is required" });

      const created = await prisma.content.create({ data: { title, body } });
      res.status(201).json(created);
    } catch (e) {
      next(e);
    }
  }
);

// 置換更新
app.put(
  "/contents/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseId(req.params.id);
      if (id == null) return res.status(400).json({ message: "invalid id" });

      const { title, body } = req.body;
      if (!title) return res.status(400).json({ message: "title is required" });

      const updated = await prisma.content.update({
        where: { id },
        data: { title, body },
      });
      res.json(updated);
    } catch (e) {
      next(e);
    }
  }
);

// 部分更新
app.patch(
  "/contents/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseId(req.params.id);
      if (id == null) return res.status(400).json({ message: "invalid id" });

      const { title, body } = req.body;
      const updated = await prisma.content.update({
        where: { id },
        data: { title, body },
      });
      res.json(updated);
    } catch (e) {
      next(e);
    }
  }
);

// 削除
app.delete(
  "/contents/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseId(req.params.id);
      if (id == null) return res.status(400).json({ message: "invalid id" });

      await prisma.content.delete({ where: { id } });
      res.sendStatus(204); 
    } catch (e) {
      next(e);
    }
  }
);

// 共通エラーハンドラ
app.use(
  (err: any, _req: Request, res: Response, _next: NextFunction) => {
    // Prisma: レコードが見つからない更新/削除は404を返す
    if (typeof err === "object" && err && (err as any).code === "P2025") {
      return res.status(404).json({ message: "not found" });
    }

    console.error(err);
    res.status(500).json({ message: "internal error" });
  }
);

// サーバ起動 & 終了時にPrismaを切断
const port = Number(process.env.PORT ?? 3000);
const server = app.listen(port, () =>
  console.log(`listening on port ${port}`)
);

// SIGTERM/SIGINTを受けたらPrismaを切断
const gracefulShutdown = async () => {
  try {
    await prisma.$disconnect();
  } finally {
    server.close(() => process.exit(0));
  }
};
process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
