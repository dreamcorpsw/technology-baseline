import {path} from "../utils/utils";

describe("Function that return a path string", () => {
    it("Should return a right string", () => {
        expect("/public/plugins/dreamcorp-app").toEqual(path())
    })
})
