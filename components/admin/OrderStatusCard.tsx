export const renderStatusBadge = (status: string) => {
    let bgColor = 'bg-gray-100'
    let textColor = 'text-gray-800'

    switch (status?.toUpperCase()) {
        case 'COMPLETED':
        case 'DELIVERED':
            bgColor = 'bg-green-100'
            textColor = 'text-green-800'
            break
        case 'PROCESSING':
        case 'CONFIRMED':
        case 'SHIPPED':
            bgColor = 'bg-yellow-100'
            textColor = 'text-yellow-800'
            break
        case 'CANCELLED':
        case 'FAILED':
            bgColor = 'bg-red-100'
            textColor = 'text-red-800'
            break
        case 'PENDING':
            bgColor = 'bg-blue-100'
            textColor = 'text-blue-800'
            break
    }

    return (
        <span className={`px-2 py-1 ${bgColor} ${textColor} rounded-full text-xs`}>
            {status}
        </span>
    )
}