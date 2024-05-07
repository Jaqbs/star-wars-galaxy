import { API } from "./API";

export function getPlanets(page) {
    return API().get(`/planets/?page=${page}`)  
}

export function searchPlanets(searchTerm) {
    return API().get(`/planets/?search=${searchTerm}`)  
}
