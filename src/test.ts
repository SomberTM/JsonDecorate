import { constructorName, JsonObject } from "./util";
import { ChildOf, deserialize, Json, serialize } from "./decorators/Json";
import { Property } from "./decorators/Property";
import { Metadata } from "./Metadata";
import { Serialize } from "./decorators/Serializable";
import { Default } from "./decorators/Default";
import { Resolve } from "./decorators/Resolver";
import { Defer } from "./decorators/Defer";
import { DeferAll } from "./decorators/DeferAll";

@Json
class Person {

    constructor(data: JsonObject) { deserialize(this, data); }

    @Property
    public name!: string;

}

@ChildOf(Person)
class User extends Person {

    constructor(data: JsonObject) {
        super(data);
        deserialize(this, data);
    }

    @Serialize("first_name")
    @Defer("name", (name: string) => name.split(" ")[0])
    public firstName!: string;

    @Serialize("last_name")
    @Defer("name", (name: string) => name.split(" ")[1])
    public lastName!: string;

    @Serialize("cool_name")
    @DeferAll([ "codeName", "age" ], (cd, age) => `${cd}_${age}`)
    public coolName!: string;

    @Property("pet_name")
    public petName!: string;

    @Serialize
    public age: number = 0;

    @Serialize("code_name")
    private codeName: string = "Jahseh";

    @Default({})
    public parents!: JsonObject<User>;

    @Resolve("date_of_birth", (timestamp: number) => new Date(timestamp ?? Date.now()))
    public dateOfBirth!: Date;

}

(async function() {
    
    console.log(Metadata);

    console.time('deserialize');
    const user = new User({
        name: "Joe Bama",
        pet_name: "Doggy",
        date_of_birth: 1622731014826,
        parents: { father: new User({ name: "Mr. Obama" }), mother: "Joe" }
    })
    console.timeEnd('deserialize');

    console.time('serialize');
    let x = serialize(user);
    console.timeEnd('serialize');

    console.log(x);

})();