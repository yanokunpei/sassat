import { CodeGenerator } from './generator';
import { TsCodeGenerator } from './ts/generator';
import { config } from '../config/config';
import * as path from 'path';
import { emptyDir, writeFile } from 'fs-extra';
import { mkDirIfNotExist, writeFileIfNotExist } from '../util/fsUtil';
import { IrGql } from '../ir/gql';
import { CodeGeneratable } from '../node/codeGeneratable';
import { EntityNode } from '../node/entity';
import { RepositoryNode } from '../node/repository';
import { EntityPath, GeneratedPath, GeneratedRepositoryPath, RepositoryPath } from '../constants/directory';

export class CodeGenerateController {
  private codeGen: CodeGenerator = new TsCodeGenerator();
  private outDir = config().migration.out;
  private repositoryDir = path.join(this.outDir, RepositoryPath);
  private generateDir = path.join(this.outDir, GeneratedPath);
  private generateEntityDir = path.join(this.outDir, EntityPath);
  private generateRepositoryDir = path.join(this.outDir, GeneratedRepositoryPath);
  constructor(readonly ir: CodeGeneratable, readonly gql: IrGql) {}
  async generate() {
    await this.prepareDirs();
    await Promise.all([
      ...this.ir.entities.map(it => this.generateEntity(it)),
      ...this.ir.repositories.map(it => this.generateRepository(it)),
      ...this.ir.repositories.map(it => this.generateGeneratedRepository(it)),
      ...this.generateGql(this.ir, this.gql),
      ...this.generateOnceFiles(this.ir),
    ]);
  }

  private async prepareDirs() {
    mkDirIfNotExist(this.generateDir);
    await emptyDir(this.generateDir);
    mkDirIfNotExist(this.generateEntityDir);
    mkDirIfNotExist(this.generateRepositoryDir);
    mkDirIfNotExist(this.repositoryDir);
  }

  private getFullPath(basePath: string, entityName: string) {
    return path.join(basePath, `${entityName}.${this.codeGen.fileExt}`);
  }

  private generateEntity(ir: EntityNode) {
    return writeFile(this.getFullPath(this.generateEntityDir, ir.entityName.name), this.codeGen.generateEntity(ir));
  }

  private generateRepository(ir: RepositoryNode) {
    return writeFileIfNotExist(
      this.getFullPath(this.repositoryDir, ir.entityName.name),
      this.codeGen.generateRepository(ir),
    );
  }

  private generateGeneratedRepository(ir: RepositoryNode) {
    return writeFile(
      this.getFullPath(this.generateRepositoryDir, ir.entityName.name),
      this.codeGen.generateGeneratedRepository(ir),
    );
  }

  private generateGql(data: CodeGeneratable, gql: IrGql) {
    return [
      writeFile(this.getFullPath(this.generateDir, 'typeDefs'), this.codeGen.generateGqlTypeDefs(gql)),
      writeFile(this.getFullPath(this.generateDir, 'resolver'), this.codeGen.generateGqlResolver(gql.resolvers)),
      writeFile(this.getFullPath(this.generateDir, 'query'), this.codeGen.generateGqlQuery(data.repositories)),
      writeFile(this.getFullPath(this.generateDir, 'mutation'), this.codeGen.generateGqlMutation(gql.mutations)),
      writeFile(
        this.getFullPath(this.generateDir, 'subscription'),
        this.codeGen.generateGqlSubscription(gql.mutations),
      ),
      writeFile(this.getFullPath(this.generateDir, 'context'), this.codeGen.generateGqlContext(gql.contexts)),
    ];
  }

  private generateOnceFiles(ir: CodeGeneratable) {
    return this.codeGen
      .generateOnceFiles(ir)
      .map(it => writeFileIfNotExist(this.getFullPath(this.outDir, it.name), it.body));
  }
}
