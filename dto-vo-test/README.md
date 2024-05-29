开发 CRUD 接口的时候，经常会发现 update 的 dto 和 create 的 dto 很类似，而我们要重复的写两次。

这时候可以用 @nestjs/mapped-types 的 PartialType、PickType、OmitType、IntersectionType 来避免重复。

PickType 是从已有 dto 类型中取某个字段。

OmitType 是从已有 dto 类型中去掉某个字段。

PartialType 是把 dto 类型变为可选。

IntersectionType 是组合多个 dto 类型。

灵活运用这些方法，可以轻松的基于已有 dto 创建出新的 dto。

- `PartialType` 是把 dto 类型变为可选。
```js
export class UpdateAaaDto extends PartialType(CreateAaaDto) {}
```

- `PickType` 是从已有 dto 类型中取某个字段。
```js
export class UpdateAaaDto extends PickType(CreateAaaDto, ['age', 'email']) {}
```

- `OmitType` 是从已有 dto 类型中去掉某个字段。
```js
export class UpdateAaaDto extends OmitType(CreateAaaDto, ['name', 'hoobies', 'sex']) { }
```

- `IntersectionType` 是组合多个 dto 类型。
```js
export class UpdateAaaDto extends IntersectionType(CreateAaaDto, XxxDto) {}
```

- 组合使用
```js
export class UpdateAaaDto extends IntersectionType(
  PickType(CreateAaaDto, ['name', 'age']),
  PartialType(OmitType(XxxDto, ['yyy']))
) {

}
```