import DecoratedElement from "./decoratedElement";
import { JsonConvert, Default, Defer, DeferAll, deserialize, Json, Property, Resolve, serialize, Serialize, generateClass } from "./json";

@Json
class User extends JsonConvert {

    constructor(data: any) {
        super(data);
    }

    @Property("first_name")
    public firstName!: string;

    @Property("last_name")
    public lastName!: string;

    @DeferAll([ "firstName", "lastName" ], ((first, last) => first + " " + last))
    @Serialize("full_name")
    public fullName!: string;

    @Serialize("starting_age")
    public startingAge: number = 0;

    @Default(72)
    public height!: number;

    @Resolve("date_of_birth", (date: Date) => date.getTime())
    public dateOfBirth!: number;

}

(async function() {

    let data = {
        first_name: "Joe",
        last_name: "Mama",
        date_of_birth: new Date("11/20/1999")
    };

    // const user = new User(data);

    // console.log(user.serialize());
    console.log(generateClass(data));

})();