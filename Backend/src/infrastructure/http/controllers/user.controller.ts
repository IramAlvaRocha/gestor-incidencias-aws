import { email } from "zod";
import type { User } from "../../../domain/entities/user.entity.js";
import type { RegistrarUsuarioUseCase } from "../../../application/use-cases/user/RegistrarUsuario.js";
import type { ListarUsuariosUseCase } from "../../../application/use-cases/user/ListarUsuarios.js";
import type { Response, Request } from "express";
import {
  DomainError,
  EmailYaRegistradoError,
} from "../../../domain/errors/DomainError.js";

const toUserResponse = (user: User) => ({
  id: user.id,
  nombre: user.nombre,
  rol: user.rol,
  email: user.email,
  fechaCreacion: user.fechaCreacion,
});

export class UserController {
  constructor(
    private readonly registrarUsuarioUseCase: RegistrarUsuarioUseCase,
    private readonly listarUsuariosUseCase: ListarUsuariosUseCase,
  ) {}

  registrar = async (req: Request, res: Response) => {
    try {
      const usuario = await this.registrarUsuarioUseCase.execute(req.body);
      return res.status(201).json(toUserResponse(usuario));
    } catch (error) {
      if (error instanceof EmailYaRegistradoError) {
        return res.status(409).json({ error: error.message });
      }
      if (error instanceof DomainError) {
        return res.status(400).json({ error: error.message });
      }
      console.error(error);
      return res
        .status(500)
        .json({ error: "Error interno al registrar usuario" });
    }
  };

  listar = async(req: Request, res: Response) => {
    

    const usuarios = await this.listarUsuariosUseCase.execute()

    return res.status(200).json(usuarios.map(toUserResponse))
  }
}
