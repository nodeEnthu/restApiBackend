export function filterProviderResponse(provider) {
    if (provider && provider.name) { // some prelim check that we have some valid provider here
        let filteredProvider = {
            _id: provider._id,
            name: provider.name,
            img: provider.img,
            email: provider.email,
            phone:provider.phone,
            userType: provider.userType,
            foodItems: provider.foodItems,
            service: provider.service,
            reviewEligibleFoodItems: provider.reviewEligibleFoodItems,
            imgUrl: provider.imgUrl,
            published: provider.published,
            publishStage: provider.publishStage,
            serviceOffered: provider.serviceOffered,
            addtnlComments: provider.addtnlComments,
            title: provider.title,
            methodsOfPayment: provider.methodsOfPayment,
            description: provider.description,
            deliveryRadius: provider.deliveryRadius,
            deliveryMinOrder: provider.deliveryMinOrder,
            currency: provider.currency,
            searchText: provider.searchText,
            place_id: provider.place_id,
            displayAddress: provider.displayAddress,
            ordersReceived: provider.ordersReceived,
            ordersConfirmed: provider.ordersConfirmed,
            ordersCancelled: provider.ordersCancelled
        }
        return filteredProvider
    } else return provider;
}
