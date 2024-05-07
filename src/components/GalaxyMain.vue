<template>
  <main>
    <h2 class="mb-2">Planet search:</h2>

    <v-text-field
      v-model="searchInput"
      label="(Enter at least 2 characters)"
      outlined
      dense
    ></v-text-field>

    <p class="search-clear mb-8" @click="clearSearchInput">&times; CLEAR SEARCH</p>

    <v-container class="mb-6">
      <v-row class="text-subtitle-1 font-weight-bold mb-4">SORT BY:</v-row>
      <v-row class="ga-4">
        <v-btn size="small" variant="outlined" @click="sortBy('name')">Name</v-btn>
        <v-btn size="small" variant="outlined" @click="sortBy('population')">Population</v-btn>
        <v-btn size="small" variant="outlined" @click="sortBy('rotation_period')">
          Rotation period
        </v-btn>
        <v-btn size="small" variant="outlined" @click="sortBy('climate')">Climate</v-btn>
        <v-btn size="small" variant="outlined" @click="sortBy('gravity')">Gravity</v-btn>
        <v-btn size="small" variant="outlined" @click="sortBy('created')">Created</v-btn>
      </v-row>
    </v-container>

    <v-container>
      <v-row>
        <v-col v-for="planet in sortedItems" :key="planet.name" cols="12" sm="6" md="4" lg="3">
          <v-card class="planet-card" color="#4f6179">
            <v-card-title>{{ planet.name }}</v-card-title>
            <v-card-text>
              <p><span>Population:</span> {{ planet.population }}</p>
              <p><span>Rotation Period:</span> {{ planet.rotation_period }}</p>
              <p><span>Climate:</span> {{ planet.climate }}</p>
              <p><span>Gravity:</span> {{ planet.gravity }}</p>
              <p>
                <span>Created:</span> {{ new Date(planet.created).toLocaleDateString('en-GB') }}
              </p>
              <p><span>URL:</span> {{ planet.url }}</p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <v-container class="text-center">
      <div v-if="totalPages === 0" class="text-h5 mt-10">NO RESULTS</div>
    </v-container>

    <v-pagination
      v-if="totalPages > 1"
      v-model="page"
      :length="totalPages"
      next-icon="mdi-menu-right"
      prev-icon="mdi-menu-left"
      @update:modelValue="handlePageChange"
    ></v-pagination>
  </main>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { getPlanets, searchPlanets } from '../services/dataAPI'

const responseData = ref({})
const planets = ref([])
const searchInput = ref('')
const page = ref(1)
const itemsPerPage = 10

// Get data

const getPlanetsForPage = async (page) => {
  try {
    const response = await getPlanets(page)
    responseData.value = response.data
    planets.value = responseData.value.results
  } catch (error) {
    console.error('Data error:', error)
  }
}

onMounted(async () => {
  getPlanetsForPage(1)
})

const searchPlanetsWithTerm = async (input) => {
  try {
    const response = await searchPlanets(input)
    responseData.value = response.data
    planets.value = responseData.value.results
  } catch (error) {
    console.error('Data error:', error)
  }
}

// Search input

watch(searchInput, (searchInput) => {
  if (searchInput.length === 0) {
    page.value = 1
    getPlanetsForPage(1)
    return
  }

  if (searchInput.length === 1) {
    planets.value = []
    responseData.value.count = 0
    return
  }

  searchPlanetsWithTerm(searchInput)
})

const clearSearchInput = () => {
  searchInput.value = ''
}

// Pagination

const totalPages = computed(() => {
  return Math.ceil(responseData.value.count / itemsPerPage)
})

const handlePageChange = (pageNumber) => {
  getPlanetsForPage(pageNumber)
}

// Sorting

const sortByField = ref('')
const sortDirection = ref('asc')

const sortedItems = computed(() => {
  if (!sortByField.value) return planets.value

  return planets.value.slice().sort((a, b) => {
    const aValue = a[sortByField.value]
    const bValue = b[sortByField.value]

    const numberTypes = ['rotation_period', 'population']

    if (numberTypes.includes(sortByField.value)) {
      return sortDirection.value === 'asc'
        ? Number(aValue) - Number(bValue)
        : Number(bValue) - Number(aValue)
    } else {
      return sortDirection.value === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }
  })
})

const sortBy = (field) => {
  if (sortByField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortByField.value = field
    sortDirection.value = 'asc'
  }
}
</script>

<style scoped>
.search-clear {
  color: #ef5350;
  cursor: pointer;

  &:hover {
    color: #b71c1c;
    transition: 150ms color linear;
  }
}
.planet-card {
  margin-bottom: 20px;
  min-height: 250px;

  .v-card-title {
    background-color: #222b40;
    margin-bottom: 15px;
  }

  .v-card-text {
    line-height: 24px;

    span {
      font-weight: 700;
    }
  }
}
</style>
