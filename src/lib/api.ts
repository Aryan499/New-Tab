// A reusable helper function to handle all API requests.
export async function apiFetch(url: string, options: RequestInit = {}) {
  const response = await fetch(url, options);
  const contentType = response.headers.get("content-type");

  if (!response.ok) {
    if (contentType && contentType.includes("application/json")) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Server error: ${response.statusText}`);
    }
    const errorText = await response.text();
    throw new Error(`Server responded with an error: ${errorText}`);
  }
  
  if (response.status === 204 || !contentType || !contentType.includes("application/json")) {
    return null;
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || 'An unknown API error occurred');
  }
  return result.data;
}