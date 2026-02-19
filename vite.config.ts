import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Cấu hình tối giản 100%, không bơm bất kỳ tường lửa nào
export default defineConfig({
  plugins: [react()],
  base: './',
})
