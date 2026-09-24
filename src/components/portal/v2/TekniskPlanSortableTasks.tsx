"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useToast } from "@/components/shared/toast-provider";
import { reorderTasks } from "@/app/portal/tren/teknisk-plan/actions";
import { OppgaveEditLauncher } from "@/app/portal/tren/teknisk-plan/[planId]/oppgave-edit-launcher";
import type { OppgaveDraft } from "@/components/teknisk-plan/oppgave-modal";
import type { TekniskTaskKortProps } from "./TekniskPlanV2";

export interface SortableTaskItem {
  id: string;
  draft: OppgaveDraft;
  cardProps: Omit<TekniskTaskKortProps, "onClick" | "dragHandleProps">;
}

interface TekniskPlanSortableTasksProps {
  positionId: string;
  tasks: SortableTaskItem[];
}

function SortableTaskRow({
  item,
  index,
}: {
  item: SortableTaskItem;
  index: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
    zIndex: isDragging ? 10 : "auto",
    position: "relative",
  };

  return (
    <div ref={setNodeRef} style={style}>
      <OppgaveEditLauncher
        taskId={item.id}
        draft={item.draft}
        cardProps={{
          ...item.cardProps,
          prio: index + 1,
          dragHandleProps: { ...attributes, ...listeners },
        }}
      />
    </div>
  );
}

export function TekniskPlanSortableTasks({
  positionId,
  tasks: initialTasks,
}: TekniskPlanSortableTasksProps) {
  const toast = useToast();
  const [tasks, setTasks] = useState(initialTasks);

  // Synkroniser når nye oppgaver legges til eller server rendrer på nytt
  const [prevInitial, setPrevInitial] = useState(initialTasks);
  if (initialTasks !== prevInitial) {
    setPrevInitial(initialTasks);
    setTasks(initialTasks);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const nextTasks = arrayMove(tasks, oldIndex, newIndex);
    setTasks(nextTasks);

    try {
      await reorderTasks(
        positionId,
        nextTasks.map((t) => t.id),
      );
      toast.success("Prioritetsrekkefølge oppdatert");
    } catch (err) {
      setTasks(tasks); // Tilbakestill ved feil
      toast.error(err instanceof Error ? err.message : "Kunne ikke oppdatere rekkefølge");
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {tasks.map((item, index) => (
            <SortableTaskRow key={item.id} item={item} index={index} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
