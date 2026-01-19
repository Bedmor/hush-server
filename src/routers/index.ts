import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

export const appRouter = router({
  // Create a new place
  createPlace: publicProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      latitude: z.number(),
      longitude: z.number(),
      // Vibe inputs
      isStudying: z.boolean().optional(),
      isDimlyLit: z.boolean().optional(),
      hasOutlets: z.boolean().optional(),
      hasWifi: z.boolean().optional(),
      // Premium inputs
      isPremium: z.boolean().optional(),
      hasErgonomicChair: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const place = await ctx.prisma.place.create({
        data: {
          name: input.name,
          description: input.description,
          latitude: input.latitude,
          longitude: input.longitude,
          isStudying: input.isStudying || false,
          isDimlyLit: input.isDimlyLit || false,
          hasOutlets: input.hasOutlets || false,
          hasWifi: input.hasWifi || false,
          isPremium: input.isPremium || false,
          hasErgonomicChair: input.hasErgonomicChair || false,
        },
      });
      return place;
    }),

  // Add a noise measurement to a place
  addMeasurement: publicProcedure
    .input(z.object({
      placeId: z.string(),
      value: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      const measurement = await ctx.prisma.measurement.create({
        data: {
          placeId: input.placeId,
          value: input.value,
        },
      });
      return measurement;
    }),

  // Get all places with their average measurement
  getPlaces: publicProcedure
    .query(async ({ ctx }) => {
      const places = await ctx.prisma.place.findMany({
        include: {
          measurements: true,
        },
      });

      // Calculate average decibels on the fly (or better, store it in Place and update it)
      // For MVP, on-the-fly is fine for small datasets.
      const placesWithAvg = places.map((place) => {
        const total = place.measurements.reduce((acc, m) => acc + m.value, 0);
        const avg = place.measurements.length > 0 ? total / place.measurements.length : null;
        return {
          ...place,
          averageDecibel: avg,
        };
      });

      return placesWithAvg;
    }),
});

export type AppRouter = typeof appRouter;
