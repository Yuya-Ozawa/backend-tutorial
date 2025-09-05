# API-Tutorial

```
nodenv install
npm i -g ts-node
```

1. Hello World
インストール
```
cd samples/hello-world
yarn
```

起動
```
yarn start
```

2. CRUD API
インストール
```
cd samples/method
yarn
```

DB起動
```
// samplesディレクトリに移動
cd ../
docker-compose up -d
```

起動
```
cd samples/method
yarn migration
yarn start
```

マイグレーションファイルを作成する場合
```
yarn make:migration
```

マイグレーションの実行
```
yarn migration
```

ロールバック
```
yarn rollback
```
