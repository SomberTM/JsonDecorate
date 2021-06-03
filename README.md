# __json-decorate__
##### Serialize and deserialize json data to and from classes using experimental decorators

### Requirements
json-decorate makes use of typescripts experimental decorators and therefore must be enabled in your tsconfig
###### **tsconfig.json**
```json
{
    "compilerOptions": {
        "experimentalDecorators": true, /* Enables experimental support for ES7 decorators. */
        "emitDecoratorMetadata": true  /* Enables experimental support for emitting type metadata for decorators. */
    }
}
```