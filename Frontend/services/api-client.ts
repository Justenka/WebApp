export const userApi = {
  // Get the current user's name from the backend
  getUserName: async (): Promise<string> => {
    const response = await fetch("http://localhost:5000/api/user/name", {
    })

    if (!response.ok) {
      throw new Error("Failed to fetch user name")
    }

    const data = await response.json()
    return data.name
  },

  // Save the current user's name to the backend
  saveUserName: async (name: string): Promise<void> => {
    const response = await fetch("http://localhost:5000/api/user/name", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })

    if (!response.ok) {
      throw new Error("Failed to save user name")
    }
  },
}