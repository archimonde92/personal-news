const AppCustom = {
    appolo: {
        getMutationResponse: (isSuccess: boolean, data: any, errCode?: number) => {
            if (isSuccess) {
                return {
                    code: 200,
                    success: true,
                    message: "Success",
                    data
                }
            } else {
                return {
                    code: errCode,
                    success: false,
                    message: errCode
                }
            }
        }
    },
    
}