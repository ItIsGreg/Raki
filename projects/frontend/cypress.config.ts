import { defineConfig } from "cypress";
import * as XLSX from 'xlsx'

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        readExcelRowCount(filePath) {
          const workbook = XLSX.readFile(filePath)
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
          const data = XLSX.utils.sheet_to_json(firstSheet)
          return data.length
        },
      })
    },
    // ... rest of your config
  },
})