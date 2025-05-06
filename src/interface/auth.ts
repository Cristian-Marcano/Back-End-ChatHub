import { UUID } from "node:crypto"
import { JwtPayload } from "jsonwebtoken"

export interface AuthPayload extends JwtPayload {
    id: UUID
}