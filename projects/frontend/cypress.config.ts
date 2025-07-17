import { defineConfig } from "cypress";
import * as XLSX from 'xlsx'
import * as fs from 'fs'
import * as path from 'path'

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
        deleteFile(filePath) {
          try {
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath)
            }
            return null
          } catch (error) {
            return null
          }
        },
      })
    },
    // ... rest of your config
  },
})