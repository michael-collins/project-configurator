<template>
  <div class="container mx-auto p-4">
    <div v-if="pending" class="text-center text-gray-500">Loading...</div>
    <div v-if="error" class="text-center text-red-500">{{ error.message }}</div>
    <div v-if="projects">
      <div v-for="project in projects.items" :key="project.sys.id" class="mb-8 p-4 bg-white shadow-md rounded-lg">
        <h2 v-if="project.fields && project.fields.title" class="text-2xl font-bold mb-4">{{ project.fields.title }}</h2>
        
        <div v-if="project.fields && project.fields.specializations">
          <h3 class="text-xl font-semibold mb-2">Specializations</h3>
          <div v-for="specialization in project.fields.specializations" :key="specialization.sys.id" class="mb-4">
            <h4 v-if="specialization.fields && specialization.fields.title" class="text-lg font-medium">{{ specialization.fields.title }}</h4>
            <p v-if="specialization.fields && specialization.fields.description" class="text-gray-700">{{ specialization.fields.description }}</p>
            <Collapse v-if="specialization.fields && specialization.fields.learningObjectives && specialization.fields.learningObjectives.content[0] && specialization.fields.learningObjectives.content[0].content" :title="'Learning Objectives'">
              <ul class="list-disc list-inside mt-2">
                <li v-for="objective in specialization.fields.learningObjectives.content[0].content" :key="objective.content[0].content[0].value" class="text-gray-600">
                  {{ objective.content[0].content[0].value }}
                </li>
              </ul>
            </Collapse>
          </div>
        </div>

        <div v-if="project.fields && project.fields.productionSchedule">
          <h3 class="text-xl font-semibold mb-2">Production Schedule</h3>
          <div v-for="schedule in project.fields.productionSchedule" :key="schedule.sys.id" class="mb-4 p-4">
            <h4 v-if="schedule.fields && schedule.fields.scheduleBasisTitle" class="text-lg font-medium border-b-2 mt-8">{{ schedule.fields.scheduleBasisTitle }}</h4>
            <h5 v-if="schedule.fields && schedule.fields.productionTitle" class="text-lg font-medium">{{ schedule.fields.productionTitle }}</h5>
            <div v-if="schedule.fields && schedule.fields.productionOverview" v-html="renderRichText(schedule.fields.productionOverview)" class="prose mt-2 pl-4"></div>
            <div v-for="deliverable in schedule.fields.productionDeliverables" :key="deliverable.sys?.id" class="mt-4">
              <h6 v-if="deliverable && deliverable.title" class="text-md font-medium">{{ deliverable.title }}</h6>
              <div v-if="deliverable && deliverable.requirements" v-html="renderRichText(deliverable.requirements)" class="prose mt-2 ml-4"></div>
              <!-- <Collapse v-if="deliverable && deliverable.requirements && deliverable.requirements.content[0] && deliverable.requirements.content[0].content" :title="'Requirements'">
              <ul class="list-disc list-inside mt-2">
                <li v-for="deliverable in deliverable.requirements.content[0].content" :key="requirements.content[0].content[0].value" class="text-gray-600">
                  {{ requirements.content[0].content[0].value }}
                </li>
              </ul>
            </Collapse> -->
            </div>
          </div>
        </div>

        <div v-if="project.fields && project.fields.masteryExercises">
          <h3 class="text-xl font-semibold mb-2">Mastery Exercises</h3>
          <div v-for="exercise in project.fields.masteryExercises" :key="exercise.sys.id" class="mb-4">
            <Collapse :title="exercise.fields.title">
              <div v-if="exercise.fields && exercise.fields.content" v-html="renderRichText(exercise.fields.content)" class="prose mt-2"></div>
            </Collapse>
          </div>
        </div>
      </div>
    </div>
    <div v-if="projects" class="mt-8">
      <h3 class="text-xl font-semibold mb-2">Fetched Project JSON</h3>
      <pre class="bg-gray-100 p-4 rounded-lg overflow-auto">{{ JSON.stringify(projects, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup>
const { $contentful } = useNuxtApp()

const projects = ref(null)
const pending = ref(true)
const error = ref(null)

const fetchProjects = async () => {
  try {
    const response = await $contentful.getEntries({
      content_type: 'project',
      include: 2 // Ensure linked entries are included
    })
    
    // Create a map of linked entries
    const linkedEntriesMap = new Map()
    if (response.includes && response.includes.Entry) {
      response.includes.Entry.forEach(entry => {
        linkedEntriesMap.set(entry.sys.id, entry.fields)
      })
    }

    // Replace references with actual data
    response.items.forEach(project => {
      if (project.fields.productionSchedule) {
        project.fields.productionSchedule.forEach(schedule => {
          if (schedule.fields.productionDeliverables) {
            schedule.fields.productionDeliverables = schedule.fields.productionDeliverables.map(deliverable => {
              return linkedEntriesMap.get(deliverable.sys.id) || {}
            })
          }
        })
      }
      if (project.fields.lectures) {
        project.fields.lectures = project.fields.lectures.map(lecture => {
          return linkedEntriesMap.get(lecture.sys.id) || {}
        })
      }
      if (project.fields.masteryExercises) {
        project.fields.masteryExercises = project.fields.masteryExercises.map(exercise => {
          return linkedEntriesMap.get(exercise.sys.id) || {}
        })
      }
    })

    projects.value = response
  } catch (err) {
    error.value = err
  } finally {
    pending.value = false
  }
}

onMounted(() => {
  fetchProjects()
})

const renderRichText = (richText) => {
  // Implement a function to render rich text content
  // This is a placeholder implementation
  return richText.content.map(node => {
    if (node.nodeType === 'paragraph') {
      return `<p>${node.content.map(textNode => textNode.value).join('')}</p>`
    } else if (node.nodeType === 'unordered-list') {
      return `<ul>${node.content.map(listItem => `<li>${listItem.content[0].content[0].value}</li>`).join('')}</ul>`
    }
    return ''
  }).join('')
}
</script>

<style>
/* Add any additional custom styles here */
</style>