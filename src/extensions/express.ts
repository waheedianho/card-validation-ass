import { ResponseFormat } from '../middlewares';
interface User {

}
declare global {
    namespace Express {
        interface Response {
            formatResponse: (status: number, message: string, data?: any) => ResponseFormat

        }
    }
}

export { }