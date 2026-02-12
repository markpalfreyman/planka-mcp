/**
 * Label operations for PLANKA API.
 */
import { plankaClient } from "../client.js";
import { Label, CardLabel } from "../schemas/entities.js";
import {
  CreateLabelSchema,
  UpdateLabelSchema,
  AddLabelToCardSchema,
  CreateLabelInput,
  UpdateLabelInput,
  AddLabelToCardInput,
} from "../schemas/requests.js";
import { LabelResponse, CardLabelResponse } from "../schemas/responses.js";
import { getCard } from "./cards.js";

/**
 * Create a new label on a board.
 */
export async function createLabel(input: CreateLabelInput): Promise<Label> {
  const validated = CreateLabelSchema.parse(input);

  const response = await plankaClient.post<unknown>(
    `/api/boards/${validated.boardId}/labels`,
    {
      name: validated.name,
      color: validated.color,
      position: validated.position,
    }
  );

  const parsed = LabelResponse.parse(response);
  return parsed.item;
}

/**
 * Update a label's properties.
 */
export async function updateLabel(
  labelId: string,
  input: UpdateLabelInput
): Promise<Label> {
  const validated = UpdateLabelSchema.parse(input);

  const response = await plankaClient.patch<unknown>(
    `/api/labels/${labelId}`,
    validated
  );

  const parsed = LabelResponse.parse(response);
  return parsed.item;
}

/**
 * Delete a label.
 */
export async function deleteLabel(labelId: string): Promise<void> {
  await plankaClient.delete(`/api/labels/${labelId}`);
}

/**
 * Add a label to a card.
 * Uses PLANKA 2.0 /card-labels endpoint.
 */
export async function addLabelToCard(input: AddLabelToCardInput): Promise<CardLabel> {
  const validated = AddLabelToCardSchema.parse(input);

  const response = await plankaClient.post<unknown>(
    `/api/cards/${validated.cardId}/card-labels`,
    {
      labelId: validated.labelId,
    }
  );

  const parsed = CardLabelResponse.parse(response);
  return parsed.item;
}

/**
 * Remove a label from a card.
 * Uses PLANKA 2.0 /card-labels endpoint.
 *
 * Note: We need the cardLabelId (the junction record ID), not the labelId.
 * This function finds the correct cardLabelId from the card's existing labels.
 */
export async function removeLabelFromCard(
  cardId: string,
  labelId: string
): Promise<void> {
  // Get the card to find the cardLabel record
  const cardDetails = await getCard(cardId);
  const cardLabel = cardDetails.cardLabels.find(
    (cl) => cl.labelId === labelId
  );

  if (!cardLabel) {
    // Label not on card, nothing to remove
    return;
  }

  // Try the direct card-labels endpoint first, fall back to nested endpoint
  try {
    await plankaClient.delete(`/api/card-labels/${cardLabel.id}`);
  } catch {
    // Fall back to nested endpoint if direct fails
    await plankaClient.delete(
      `/api/cards/${cardId}/card-labels/${cardLabel.id}`
    );
  }
}

/**
 * Set labels on a card (add some, remove others).
 */
export async function setCardLabels(
  cardId: string,
  addLabelIds?: string[],
  removeLabelIds?: string[]
): Promise<void> {
  // Remove labels first
  if (removeLabelIds && removeLabelIds.length > 0) {
    for (const labelId of removeLabelIds) {
      await removeLabelFromCard(cardId, labelId);
    }
  }

  // Add labels
  if (addLabelIds && addLabelIds.length > 0) {
    for (const labelId of addLabelIds) {
      try {
        await addLabelToCard({ cardId, labelId });
      } catch (error) {
        // Ignore if label already on card
        const message = error instanceof Error ? error.message : String(error);
        if (!message.includes("already")) {
          throw error;
        }
      }
    }
  }
}
