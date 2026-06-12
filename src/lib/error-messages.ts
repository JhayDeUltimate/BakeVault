type BackendError = {
  message?: string
  code?: string
  details?: string | null
  hint?: string | null
}

function messageFrom(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as BackendError).message
    if (typeof message === 'string') return message
  }
  return ''
}

export function friendlyErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const message = messageFrom(error)
  const lower = message.toLowerCase()
  const code = error && typeof error === 'object' && 'code' in error ? (error as BackendError).code : undefined

  if (!message) return fallback

  if (lower.includes('invalid input syntax for type uuid')) {
    return 'Select a valid option before saving.'
  }

  if (lower.includes('invalid input syntax')) {
    return 'One of the fields has an invalid value. Check the form and try again.'
  }

  if (lower.includes('row-level security') || lower.includes('permission denied')) {
    return 'You do not have permission to do that. Sign in as an admin and try again.'
  }

  if (code === '23505' || lower.includes('duplicate key')) {
    return 'That item already exists.'
  }

  if (lower.includes('null value in column "name"')) return 'Enter a name.'
  if (lower.includes('null value in column "product_name"')) return 'Enter a product name.'
  if (lower.includes('null value in column "customer_name"')) return 'Enter the customer name.'
  if (lower.includes('null value in column "quote"')) return 'Enter the review text.'
  if (lower.includes('null value in column "category_id"')) return 'Select a category.'
  if (lower.includes('null value in column "question"')) return 'Enter the question.'
  if (lower.includes('null value in column "answer"')) return 'Enter the answer.'
  if (lower.includes('null value in column "title"')) return 'Enter a title.'

  if (lower.includes('violates not-null constraint')) {
    return 'A required field is missing. Check the form and try again.'
  }

  if (lower.includes('violates foreign key constraint')) {
    return 'One of the selected options no longer exists. Refresh the page and try again.'
  }

  if (lower.includes('check_product_name_length')) return 'Product name must be 500 characters or less.'
  if (lower.includes('check_product_size_length')) return 'Product size must be 100 characters or less.'
  if (lower.includes('check_notes_length')) return 'Notes must be 2000 characters or less.'
  if (lower.includes('check_contact_info_length')) return 'Contact info must be 500 characters or less.'
  if (lower.includes('check_quote_length')) return 'Review must be 5000 characters or less.'
  if (lower.includes('check_customer_name_length')) return 'Customer name must be 200 characters or less.'
  if (lower.includes('check_business_name_length')) return 'Business name must be 200 characters or less.'
  if (lower.includes('check_description_length')) return 'Product description must be 50000 characters or less.'

  if (lower.includes('violates check constraint')) {
    return 'One of the fields has an invalid value. Check the highlighted fields and try again.'
  }

  return message
}
