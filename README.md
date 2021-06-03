# __json-decorate__
##### Serialize and deserialize json data to and from classes using experimental decorators

### Requirements
json-decorate makes use of typescripts experimental decorators and therefore must be enabled in your tsconfig
###### **tsconfig.json**
```json
{
    "compilerOptions": {
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true  
    }
}
```