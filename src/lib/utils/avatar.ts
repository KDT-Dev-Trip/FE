// Avatar utility functions

export const getAvatarUrl = (avatarUrl?: string | null, name?: string) => {
  if (avatarUrl) {
    return avatarUrl
  }
  
  // Generate a default avatar based on the user's name
  if (name) {
    const initial = name.charAt(0).toUpperCase()
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=ffffff&size=150&rounded=true`
  }
  
  // Fallback default avatar
  return `https://ui-avatars.com/api/?name=User&background=6366f1&color=ffffff&size=150&rounded=true`
}

export const getAvatarFallback = (name?: string) => {
  if (name) {
    return name.charAt(0).toUpperCase()
  }
  return "U"
}