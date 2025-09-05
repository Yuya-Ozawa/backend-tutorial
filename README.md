# Backend Tutorial

目的: Express + Prisma + MySQL で Content の CRUD を提供（GET / は “Hello World”）。

変更点: もともと TypeORM の雛形があったが、Prisma へ移行。TypeORM 関連は削除済み。

1) DB（Docker）を起動・確認
```
cd ~/dev/API-Tutorial/samples
docker compose up -d
docker compose ps       
```

3) API 用の環境変数を用意
```
cd ~/dev/API-Tutorial/samples/method
cp -n .env.example .env   
# .env の DATABASE_URL を確認:
# DATABASE_URL="mysql://docker:docker@127.0.0.1:13306/example_db"
```

3) 依存インストール & Prisma 準備
```
yarn install
npx prisma generate
npx prisma migrate deploy  
```

5) サーバ起動（Hello World 確認）
```
yarn start
# → listening on port 3000
# 別ターミナルで:
curl http://localhost:3000/
# => Hello World
```

5) CRUD 動作確認（Content）
```
# 作成
curl -sS -X POST http://localhost:3000/contents \
  -H 'Content-Type: application/json' \
  -d '{"title":"Hello","body":"World"}'

# 一覧
curl -sS http://localhost:3000/contents

# 1件取得（id は作成レスポンスの id を使う）
curl -sS http://localhost:3000/contents/<id>

# 置換更新
curl -sS -X PUT http://localhost:3000/contents/<id> \
  -H 'Content-Type: application/json' \
  -d '{"title":"Hello2","body":"World2"}'

# 部分更新
curl -sS -X PATCH http://localhost:3000/contents/<id> \
  -H 'Content-Type: application/json' \
  -d '{"body":"Partial"}'

# 削除（204 No Content）
curl -i -sS -X DELETE http://localhost:3000/contents/<id> | sed -n '1,5p'
```

モデル（Prisma）
```
model Content {
  id        Int      @id @default(autoincrement())
  title     String
  body      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```
