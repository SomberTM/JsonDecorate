import { Json } from "./json";

@Json.Json
class User extends Json.Convert {

    constructor(data: any) {
        super(data);
    }

    @Json.Property("first_name")
    public firstName!: string;

    @Json.Property("last_name")
    public lastName!: string;

    @Json.DeferAll([ "firstName", "lastName" ], ((first: string, last: string) => first + " " + last))
    @Json.Serialize("full_name")
    public fullName!: string;

    @Json.Serialize("starting_age")
    public startingAge: number = 0;

    @Json.Default(72)
    public height!: number;

    @Json.Resolve("date_of_birth", (date: Date) => date.getTime())
    public dateOfBirth!: number;

}

(async function() {

    let data = {
        first_name: "Joe",
        last_name: "Mama",
        date_of_birth: new Date("11/20/1999")
    };

    const user = new User(data);
    console.log(user.serialize());

})();