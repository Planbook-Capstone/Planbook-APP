import {
  createMutationHook
} from "@/hooks/react-query";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";


export const useCreateMaterialInternalService = createMutationHook(
  "private-materials",
  API_ENDPOINTS.ACADEMIC_RESOURSE_INTERNAL
);

// export const useMaterialInternalService = createQueryHook(
//   "private-materials",
//   API_ENDPOINTS.ACADEMIC_RESOURSE_INTERNAL
// );

// Infinite query hook for lazy loading materials
// export const useMaterialInternalInfiniteService = () => {
//   return useInfiniteQuery({
//     queryKey: ["private-materials-infinite"],
//     queryFn: async ({ pageParam = 0 }) => {
//       const response = await api.get(API_ENDPOINTS.ACADEMIC_RESOURSE_INTERNAL, {
//         params: {
//           page: pageParam,
//           size: 20, // Load 20 items per page
//         },
//       });
//       return response.data;
//     },
//     getNextPageParam: (lastPage, allPages) => {
//       // Check if last page has content
//       const content = lastPage?.data?.content || lastPage?.data;
//       if (!content || content.length === 0) {
//         return undefined; // No more pages
//       }

//       // If we got less than page size, no more pages
//       if (content.length < 20) {
//         return undefined;
//       }

//       return allPages.length; // Next page number
//     },
//     initialPageParam: 0,
//   });
// };

// Get material by ID
// export const useMaterialByIdService = createQueryWithPathParamHook(
//   "material-detail",
//   API_ENDPOINTS.ACADEMIC_RESOURCE
// );

// // Update material service
// export const useUpdateMaterialService = updateMutationHook(
//   "materials",
//   API_ENDPOINTS.ACADEMIC_RESOURCE
// );

// // export const useUpdateBookStatus = patchMutationHook("books", API_ENDPOINTS.BOOKS);
// export const useMaterialsWithParamsService = createDynamicQueryHook(
//   "materials",
//   API_ENDPOINTS.ACADEMIC_RESOURSE_INTERNAL
// );

// export const useDeleteMaterialService = deleteMutationHook(
//   "materials",
//   API_ENDPOINTS.ACADEMIC_RESOURCE
// );
