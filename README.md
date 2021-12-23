# everest-fanyi

## VS Code everest-fanyi

[![Version](https://vsmarketplacebadge.apphb.com/version/maqi1520.everest-fanyi.svg)](https://vsmarketplacebadge.apphb.com/version-short/maqi1520.everest-fanyi.svg)
[![Install](https://vsmarketplacebadge.apphb.com/installs/maqi1520.everest-fanyi.svg)](https://vsmarketplacebadge.apphb.com/installs-short/maqi1520.everest-fanyi.svg)
[![Ratings](https://vsmarketplacebadge.apphb.com/rating-short/maqi1520.everest-fanyi.svg)](https://vsmarketplacebadge.apphb.com/rating-short/maqi1520.everest-fanyi.svg)

---

## 安装

安装扩展您需要启动命令面板中(Ctrl + Shift + P 或 Cmd + Shift + P)和类型的扩展。

## 使用

### 翻译单词

选中想要翻译的单词 右键选择翻译菜单或按`cmd+t` (windows `control+t`)，就可以替换选中内容

### 翻译 everest local json

- json 格式

```json
[
  ["key", "zh_CN", "en_US"],
  ["不翻译", "不翻译文本", "只有null会翻译"],
  ["transl", "翻译文本", null],
  ["say.hi", "你好", null]
]
```

打开 json 进入编辑状态 右键选择翻译菜单或按`cmd+t` (windows `control+t`)

![fanyi json](image/json.gif)

## 设置

1. 支持中文 key,根据 key 翻译，填充 key 为中文
2. 支持有道翻译（中英文互译）
3. 支持 google api 翻译
4. 支持设置自定义 apikey 和 apiname

## snippets

根据 @uyun/hooks 生成对应 hooks 代码片段

- !useDidMount

- !useDidUpdate

- !useWillUnmount

- !useRequest

- !useRouter

- !useQueryString

- !useLocalStorage

- !useSessionStorage

- !useWindowSize

- !usePagination

- !useInputSearch

- !useFormItemLayout

- !useDebounce

- !useThrottle

- !useTween

- !useRaf

- !useTimeout

- !useInterval
