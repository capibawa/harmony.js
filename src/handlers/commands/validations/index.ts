import Client from '@/structures/client.js';
import Validation from '@/structures/validation.js';
import { getFiles, getFilesFromPath } from '@/utils/helpers.js';
import logger from '@/utils/logger.js';

export async function loadValidations(client: Client): Promise<void> {
  await loadDefaultValidations(client);
  await loadCustomValidations(client);
}

async function loadDefaultValidations(client: Client): Promise<void> {
  const validations = await getFilesFromPath(import.meta.dirname);

  processValidations(client, validations, 'default');
}

async function loadCustomValidations(client: Client): Promise<void> {
  const validations = await getFiles(client.harmony.validationsDir);

  processValidations(client, validations, 'custom');
}

function processValidations(
  client: Client,
  validations: Validation[],
  type: string,
) {
  if (validations.length === 0) {
    logger.info(`No ${type} validations found.`);
    return;
  }

  let validationCount = 0;

  for (const validation of validations) {
    if (!(validation instanceof Validation)) {
      logger.warn(
        `Validation ${validation} is not an instance of Validation. Skipping.`,
      );

      continue;
    }

    client.validations.push(validation);

    validationCount++;
  }

  logger.info(
    'Loaded %d %s %s.',
    validationCount,
    type,
    validationCount === 1 ? 'validation' : 'validations',
  );
}
