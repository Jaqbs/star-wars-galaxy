import axios from "axios";

export function API(url="https://swapi.dev/api") {
   return axios.create({
    baseURL: url
   })
}
